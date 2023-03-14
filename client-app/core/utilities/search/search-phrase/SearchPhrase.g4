grammar SearchPhrase;

searchPhrase          : WS* phrase (WS phrase)* WS*;
phrase                : keyword | filters;
keyword               : String;
filters               : negation? (attributeFilter | rangeFilter);
attributeFilter       : fieldName FD attributeFilterValue;
rangeFilter           : fieldName FD rangeFilterValue;
fieldName             : String;
attributeFilterValue  : string (VD string)*;
rangeFilterValue      : range (VD range)*;
range                 : rangeStart WS* lower? WS* RD WS* upper? WS* rangeEnd;
rangeStart            : RangeStart;
rangeEnd              : RangeEnd;
lower                 : String;
upper                 : String;
string                : String;

negation              : '!';
FD                    : ':'; // Filter delimiter
VD                    : ','; // Value delimiter
RD                    : 'TO' | 'to'; // Range delimiter
RangeStart            : '[' | '(';
RangeEnd              : ']' | ')';

String                : SimpleString | QuotedString;
fragment SimpleString : ~[!":,[\]() \t]+;
fragment QuotedString : ('"' (Esc | ~["\\])* '"');
fragment Esc          : '\\' (["\\rnt]);

WS                    : [ \t]+; // Whitespace
