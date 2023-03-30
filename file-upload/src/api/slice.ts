import { api } from "./instance";

/* 获取已经上传成功的切片 */
export const getAlready=async(hash:string)=>{
    return (await api.get(`/upload_already?hash=${hash}`)).data
}

/* 上传切片 */
export const uploadChunk=async(obj:{file:Blob,filename:string})=>{
    const formData=new FormData()
    formData.append('file',obj.file)
    formData.append('filename',obj.filename)
    return (await api.post('/upload_chunk',formData)).data
}

/* 合并切片 */
export const uploadMerge=async (hash:string,count:number)=>{
    //get请求通过params也能传递URLSearchParams参数
    return (await api.get('/upload_merge',{
        params:{
            hash,
            count
        }
    })).data
}