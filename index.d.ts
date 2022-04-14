declare type classNamesGeneratorItems = string | boolean | undefined;
declare const classNamesGenerator: (...items: classNamesGeneratorItems[]) => string;
declare const timeDisplayer: (date?: string | undefined) => string;
declare const getErrors: (payload: any) => string;
export { classNamesGenerator, timeDisplayer, getErrors };
