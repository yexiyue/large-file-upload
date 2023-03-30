import { uploadSingleBase64, uploadSingleFormData } from './../api';
import { getUploadDom, checkIsDisable,fileToBase64 } from "../utils";

/* 拖拽上传 */

const {input,uploadDrag,uploadMask,uploadSubmit,section}=getUploadDom('upload6')
let _file:File|null=null

/* 点击手动选择文件 */
uploadSubmit.addEventListener('click',(e)=>{
    e.preventDefault()
    input.click()
})

input.addEventListener('change',(ev)=>{
    _file=input.files![0]
    if(!_file)return
    uploadFile(_file)
})

/* 拖拽选择文件 */
/* section?.addEventListener('dragenter',(ev)=>{
    console.log('enter',ev)
})
section?.addEventListener('dragleave',(ev)=>{
    console.log('leave',ev)
}) */

/* 要想文件真正拖拽到容器中，需要阻止dragover 和 drop的默认行为 */
section?.addEventListener('drop',(ev)=>{
    ev.preventDefault()
    _file=ev.dataTransfer?.files[0]!

    uploadFile(_file)
})

section?.addEventListener('dragover',(ev)=>{
    ev.preventDefault()
})

/* 上传文件 */
let isRun=false
async function uploadFile(file:File){
    if(isRun)return;
    isRun=true
    uploadMask.style.display='block'
    try {
        const res=await uploadSingleFormData(file)
        if(res.data.code===0){
            return alert(`文件上传成功，地址：${res.data.servicePath}`);
        }
        throw res.data
    } catch (error) {
        alert(JSON.stringify(error))
    }finally{
        uploadMask.style.display='none'
        isRun=false
    }
}