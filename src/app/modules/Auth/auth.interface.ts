export type TLoginUser = {
  name: string;
  password: string;
  tenantDomain:string;
};




export type loginUserType = {
  tenantDomain:string;
   payload: TLoginUser,

}