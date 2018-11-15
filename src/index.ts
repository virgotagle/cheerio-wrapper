import * as cheerio from "cheerio";

export default class CheerioWrapper {
  private $: CheerioStatic;
  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  public findTable(params: { index?: number; strToSearch?: string }): any[] | undefined {
    try {
      let selectedTable: any[] = [];
      const { strToSearch } = params;
      const tables: any[] | undefined = this.getTables();
      if (tables && strToSearch) {
        tables.forEach((table: any[]) => {
          table.forEach((tr: any[]) => {
            tr.forEach((td: string) => {
              if (td.includes(strToSearch)) selectedTable = table;
            });
          });
        });
      }
      return selectedTable;
    } catch (error) {
      throw new Error(`Cheerio Wrapper Error: ${error}`);
    }
  }

  public getTable(params: {
    index?: number;
    strToSearch?: string;
    isObject?: boolean;
    tableHeaderIndex?: number;
  }): any {
    try {
      const { index, strToSearch, isObject, tableHeaderIndex } = params;
      const table: any = this.findTable({ index, strToSearch });
      if (isObject) return this.arrayTableToObject(table);
      return this.arrayTableToObjectArray(table, tableHeaderIndex);
    } catch (error) {
      throw new Error(`Cheerio Wrapper Error: ${error}`);
    }
  }

  private getTables(): any[] | undefined {
    try {
      const nodes: any = this.$("table");
      const tables: any[] = [];
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        const cleanedTable = this.cleanTable(node);
        tables.push(cleanedTable);
      }
      return tables;
    } catch (error) {
      throw new Error(`Cheerio Wrapper Error: ${error}`);
    }
  }

  private cleanTable(tableNode: any): any[] {
    try {
      const trArr: any[] = [];
      if (tableNode.childNodes && tableNode.childNodes.length) {
        tableNode.childNodes.forEach((tbody: any) => {
          if (tbody.childNodes && tbody.childNodes.length && tbody.type === "tag") {
            tbody.childNodes.forEach((tr: any) => {
              if (tr.childNodes && tr.childNodes.length && tr.type === "tag") {
                const tdArr: any[] = [];
                tr.childNodes.forEach((td: any) => {
                  if (td.type === "tag") {
                    const findTable: any = this.$(td).find("table");
                    if (!findTable.length) {
                      tdArr.push(
                        this.$(td).text()
                          ? this.$(td)
                              .text()
                              .replace(/[^\x20-\x7E]/g, "")
                          : ""
                      );
                    }
                  }
                });
                trArr.push(tdArr);
              }
            });
          }
        });
      }
      return trArr;
    } catch (error) {
      throw new Error(`Cheerio Wrapper Error: ${error}`);
    }
  }

  private arrayTableToObject(tableArray: any[]): any {
    try {
      let obj: any = {};
      tableArray.forEach((strArr: string[]) => {
        if (strArr.length > 1) {
          for (let index = 0; index < strArr.length; index++) {
            const str = strArr[index].trim();
            const propName = str.replace(":", "");
            const propValue = strArr[index + 1].trim();
            index += 1;
            if (propName && propValue)
              obj = Object.assign({}, obj, { [propName in obj ? propName + "_" : propName]: propValue });
          }
        }
      });
      return obj;
    } catch (error) {
      throw new Error(`Cheerio Wrapper Error: ${error}`);
    }
  }

  private arrayTableToObjectArray(tableArray: any[], tableHeaderIndex?: number): any {
    try {
      const objArr: any[] = [];
      const headerArray: string[] = tableArray[tableHeaderIndex ? tableHeaderIndex : 0];
      for (let index = tableHeaderIndex ? tableHeaderIndex + 1 : 1; index < tableArray.length; index++) {
        let obj: any = {};
        const arrStr: any[] = tableArray[index];
        headerArray.forEach((propName, i) => {
          obj = Object.assign({}, obj, { [propName ? propName : propName.trim() + "_"]: arrStr[i] ? arrStr[i] : "" });
        });
        objArr.push(obj);
      }
      return objArr;
    } catch (error) {
      throw new Error(`Cheerio Wrapper Error: ${error}`);
    }
  }
}
