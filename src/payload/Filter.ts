export interface SearchQuery {
    by: string;
    operator: string;
    value: any;
}

export interface Order {
    by: string;
    operator: string;
}

export interface Pagination {
    page: number;
    pageSize: number;
}

export interface Filter {
    logic: string;
    filters: SearchQuery | SearchQuery[];
    order: Order[];
    pagination: Pagination;
}