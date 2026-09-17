"""The catalog mapping: which x-api object becomes which blueprint shape."""

from __future__ import annotations

from virto_agent import mapping


def variation(product_id: str, **options: str) -> dict:
    return {
        "id": product_id,
        "name": product_id,
        "code": product_id,
        "price": {"currency": "USD", "actual": {"amount": 10.0}},
        "availabilityData": {
            "isActive": True,
            "isAvailable": True,
            "isBuyable": True,
            "isInStock": True,
        },
        "properties": [
            {"name": name, "label": name, "value": value, "propertyType": "VARIATION"}
            for name, value in options.items()
        ],
    }


def test_variation_properties_become_option_values() -> None:
    product = mapping.product_from(
        variation("V-1", Size="M"), currency="USD", master_id="P-1"
    )
    assert product.option_values == {"Size": "M"}
    assert product.variant_of == "P-1"
    assert not product.has_options


def test_non_variation_properties_become_attributes() -> None:
    record = variation("P-9")
    record["properties"].append(
        {"name": "Material", "label": "Material", "value": "steel", "propertyType": "PRODUCT"}
    )
    record["packSize"] = 12
    product = mapping.product_from(record, currency="USD")
    assert product.attributes["Material"] == "steel"
    assert product.attributes["pack_size"] == "12"
    assert product.attributes["price_context"] == mapping.PRICE_CONTEXT


def test_options_collect_every_value_across_variants() -> None:
    variants = [
        mapping.product_from(variation(f"V-{i}", Size=size, Colour=colour), currency="USD",
                             master_id="P-1")
        for i, (size, colour) in enumerate([("S", "red"), ("M", "red"), ("M", "blue")])
    ]
    assert mapping.options_from_variants(variants) == {
        "Size": ["S", "M"],
        "Colour": ["red", "blue"],
    }


def test_split_family_ids_round_trip() -> None:
    family_id = mapping.split_family_id("catalog/P-1", "Colour", "blue")
    assert mapping.parse_split_family_id(family_id) == ("catalog/P-1", "Colour", "blue")
    assert mapping.parse_split_family_id("catalog/P-1") is None


def test_a_sub_family_is_itself_a_family() -> None:
    master = variation("P-1")
    master["hasVariations"] = True
    leg = mapping.sub_family(
        master,
        currency="USD",
        option="Colour",
        value="blue",
        remaining_options={"Size": ["S", "M"]},
    )
    assert leg.has_options
    assert leg.option_values == {"Colour": "blue"}
    assert leg.variant_of == "P-1"
    assert mapping.parse_split_family_id(leg.product_id) == ("P-1", "Colour", "blue")


def test_an_unmapped_order_status_reads_as_processing() -> None:
    assert mapping.order_status_from("Shipped").value == "shipped"
    assert mapping.order_status_from("Awaiting credit review").value == "processing"


def test_a_cart_line_carries_its_master_only_when_it_differs() -> None:
    record = {
        "currency": {"code": "EUR"},
        "items": [
            {
                "id": "line-1",
                "productId": "V-1",
                "name": "Widget",
                "quantity": 2,
                "placedPrice": {"amount": 5.0},
                "product": {"id": "V-1", "masterVariation": {"id": "V-1"}, "properties": []},
            }
        ],
    }
    cart = mapping.cart_from(record, currency="USD")
    assert cart.currency == "EUR"
    assert cart.items[0].variant_of is None
    assert mapping.line_item_id_for(record, "V-1") == "line-1"


def test_a_master_is_not_a_variant_of_itself() -> None:
    """``productfamilyid`` returns the master among its own family rows."""
    product = mapping.product_from(variation("P-1"), currency="USD", master_id="P-1")
    assert product.variant_of is None
