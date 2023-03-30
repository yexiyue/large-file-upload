import axios,{AxiosError} from 'axios'
import qs from 'qs'

//创建实例
const api=axios.create()
api.defaults.baseURL='http://localhost:3000'
//设置请求头 数据格式为multipart/form-data
api.defaults.headers["Content-Type"]="multipart/form-data"
//设置请求主体格式化
api.defaults.transformRequest=(data,headers)=>{
    const ContentType=headers['Content-Type']
    //只有这种格式才进行转换
    if(ContentType==='application/x-www-form-urlencoded'){
        return qs.stringify(data)
    }
    return data
}
/* //设置超时时间
api.defaults.timeout=1500 */
//响应拦截器
api.interceptors.response.use((res)=>{
    return res
},(error:AxiosError)=>{
    //统一做失败提示处理
    alert(JSON.stringify(error.response?.data))
    return Promise.reject(error)
})

export {api}