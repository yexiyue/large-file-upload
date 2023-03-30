import { api } from "./instance";

export const uploadSingleBase64=async (file:string,filename:string)=>{
    return (await api.post('/upload_single_base64',{
        file,
        filename
    },{
        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        }
    })).data
}