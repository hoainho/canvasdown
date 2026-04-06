export type ThemeLink = {
    color: string;
    hoverColor?: string;
};
export type ThemeTable = {
    headerBackground: string;
    headerColor: string;
    borderColor: string;
    cellPadding: number;
    alternateRowBackground?: string;
};
export type Theme = {
    background: string;
    text: string;
    mutedText: string;
    link: ThemeLink;
    heading: {
        color: string;
        sizes: [number, number, number, number, number, number];
        weights: [string, string, string, string, string, string];
        lineHeights: [number, number, number, number, number, number];
    };
    code: {
        background: string;
        color: string;
        borderColor: string;
        fontFamily: string;
        fontSize: number;
        lineHeight: number;
        borderRadius: number;
        padding: number;
    };
    inlineCode: {
        background: string;
        color: string;
        fontFamily: string;
        borderRadius: number;
        paddingH: number;
    };
    blockquote: {
        borderColor: string;
        textColor: string;
        borderWidth: number;
        paddingLeft: number;
    };
    table: ThemeTable;
    hr: {
        color: string;
    };
    list: {
        bulletColor: string;
        indentX: number;
        bulletGap: number;
        itemGap: number;
    };
    image: {
        borderRadius: number;
        maxHeight: number;
    };
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    padding: number;
    blockGap: number;
};
export declare const darkTheme: Theme;
export declare const lightTheme: Theme;
export declare function headingFont(theme: Theme, level: 1 | 2 | 3 | 4 | 5 | 6): string;
export declare function bodyFont(theme: Theme): string;
export declare function boldFont(theme: Theme): string;
export declare function italicFont(theme: Theme): string;
export declare function boldItalicFont(theme: Theme): string;
export declare function inlineCodeFont(theme: Theme): string;
export declare function codeBlockFont(theme: Theme): string;
//# sourceMappingURL=theme.d.ts.map