export declare type Props = {
    bottomSpacing?: number;
    content?: () => JSX.Element;
    id?: string;
    sidebarContent?: () => JSX.Element;
    sidebarId?: string;
    sidebarInnerId?: string;
    topSpacing?: number;
};
declare const StickySidebar: ({ bottomSpacing, content, id, sidebarContent, sidebarId, sidebarInnerId, topSpacing }: Props) => JSX.Element;
export default StickySidebar;
