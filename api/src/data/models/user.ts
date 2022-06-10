
export interface User {
    email: string;
    sub: string;
    first_name: string;
    last_name: string;
    status?: string;
    roles?: string | string[];

    create_date?: Date;
}
