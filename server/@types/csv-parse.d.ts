declare module 'csv-parse' {
  export function parse(
    input: string,
    options: any,
    callback: (err: any, records: any[]) => void
  ): void;
}


