export declare type classNamesGeneratorItems = string | boolean | undefined;
export declare const classNamesGenerator: (...items: classNamesGeneratorItems[]) => string;
export declare const getFormattedTime: (date?: string | undefined) => string;
export declare const getFormValidationErrors: (payload: Record<string, unknown>) => { errors: string[]; message: string };
