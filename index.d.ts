declare type classNamesGeneratorItems = string | boolean | undefined;
declare const classNamesGenerator: (...items: classNamesGeneratorItems[]) => string;
declare const timeDisplayer: (date?: string | undefined) => string;
declare const getFormValidationErrors: (payload: Record<string, unknown>) => { errors: string[], message: string; };
export { classNamesGenerator, timeDisplayer, getFormValidationErrors };
