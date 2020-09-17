import { Term } from 'core/api/api-clients';
import { TermsDictionary } from 'core/models/search/terms-dictionary';

export class TermsData {
    data: TermsDictionary = {};

    toggle(key: string, value: string) {
      if (this.isKeyValueExists(key, value)){
        this.removeValue(key, value);
        if (this.hasAnyValue(key)){
          this.removeKey(key);
        }
      } else {
        if (!this.isKeyExists(key)){
          this.data[key] = [];
        }
        this.addValue(key, value);
      }
    }

    serialize(): string {
      return this.serializeValues().map(term => `${term.name}:${term.value}`).join(';');
    }

    serializeValues(): Term[] {
      return Object.entries(this.data).map(([key, values]) => new Term({ name: key, value: `${values.join(',')}` }));
    }

    deserialize(value?: string): TermsData {
      this.deserializeValues(value?.split(';').map(term => {
        const [name, value] = term.split(':');
        return new Term({ name, value });
      }));
      return this;
    }

    deserializeValues(values?: Term[]) {
      this.data = values?.reduce((result, term) => {
        if (term.name && term.value){
          result[term.name] = term.value.split(',');
        }
        return result;
      }, {} as TermsDictionary) || {};
    }

    private isKeyValueExists(key: string, value: string): boolean {
      return this.data[key]?.includes(value);
    }

    private isKeyExists(key: string){
      return key in this.data;
    }

    private hasAnyValue(key: string): boolean {
      return this.data[key].length == 0;
    }

    private addValue(key: string, value: string){
      return this.data[key].push(value);
    }

    private removeKey(key: string) {
      delete this.data[key];
    }

    private removeValue(key: string, value: string) {
      this.data[key].splice(this.data[key].indexOf(value), 1);
    }
}
