import { api } from "./instance";

export const uploadMultiple=async (file:File[])=>{
    //把文件上传到服务器
    const formData=new FormData()
    file.forEach(item=>{
        formData.append('file',item)
    })
    //用拦截器做了统一的错误处理
    const res=await api.post('/upload_multipart',formData,{
        onUploadProgress(progressEvent) {
            console.log(progressEvent)
        },
    })
    return res
}