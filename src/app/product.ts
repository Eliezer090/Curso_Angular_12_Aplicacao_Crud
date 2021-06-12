import { Department } from "./department";

export interface Product {
    name: string;
    departments:Department[] | String[];
    stock:number;
    price:number;
    _id?:string;
}
