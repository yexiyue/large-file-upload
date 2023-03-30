import { api } from "./instance";

export const uploadSingleFormData=async (file:File)=>{
    //把文件上传到服务器
    const formData=new FormData()
    formData.append('file',file)
    formData.append('filename',file.name)
    //用拦截器做了统一的错误处理
    const res=await api.post('/upload_single',formData)
    return res
}

export const uploadSingleName=async (file:File,filename:string)=>{
    //把文件上传到服务器
    const formData=new FormData()
    formData.append('file',file)
    formData.append('filename',filename)
    //用拦截器做了统一的错误处理
    return (await api.post('/upload_single_name',formData)).data
}
