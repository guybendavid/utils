declare type classNamesGeneratorItems = string | boolean | undefined;
declare const classNamesGenerator: (...items: classNamesGeneratorItems[]) => string;
declare const timeDisplayer: (date?: string | undefined) => string;
export { classNamesGenerator, timeDisplayer };
