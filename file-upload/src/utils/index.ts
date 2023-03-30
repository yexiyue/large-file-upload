import SparkMD5 from "spark-md5";

interface Options {
  inputSelector: string;
  selectSelector: string;
  uploadSelector: string;
  tipSelector: string;
  listSelector: string;
  abbreviationSelector: string;
  progress:string;
  uploadDrag:string;
  uploadMask:string;
  uploadSubmit:string
}

//获取要操作的dom元素
export function getUploadDom(
  id: string,
  {
    inputSelector,
    selectSelector,
    uploadSelector,
    tipSelector,
    listSelector,
    abbreviationSelector,
    progress,
    uploadDrag,
    uploadMask,
    uploadSubmit
  }: Partial<Options> = {
    inputSelector: ".upload_inp",
    selectSelector: ".upload_button.select",
    uploadSelector: ".upload_button.upload",
    tipSelector: ".upload_tip",
    listSelector: ".upload_list",
    abbreviationSelector: ".upload_abbre",
    progress:'.upload_progress',
    uploadDrag:'.upload_drag',
    uploadMask:'.upload_mask',
    uploadSubmit:'.upload_submit'
  }
) {
  const section = document.getElementById(id);
  return {
    input: section?.querySelector(inputSelector!) as HTMLInputElement,
    select: section?.querySelector(selectSelector!) as HTMLButtonElement,
    upload: section?.querySelector(uploadSelector!) as HTMLButtonElement,
    tip: section?.querySelector(tipSelector!) as HTMLDivElement,
    list: section?.querySelector(listSelector!) as HTMLUListElement,
    abbreviation: section?.querySelector(
      abbreviationSelector!
    ) as HTMLDivElement,
    progress:section?.querySelector(progress!) as HTMLDivElement,
    uploadDrag:section?.querySelector(uploadDrag!) as HTMLDivElement,
    uploadMask:section?.querySelector(uploadMask!) as HTMLDivElement,
    uploadSubmit:section?.querySelector(uploadSubmit!) as HTMLAnchorElement,
    section
  };
}

export function showList(list: HTMLUListElement) {
  let span1!: HTMLSpanElement;
  return (filename: string) => {
    //第一次时创建
    if (list.childElementCount === 0) {
      /**
       * 格式如下
       * <li>
       *  <span>文件：...</span>
       *  <span><em>移除</em></span>
       * </li>
       */
      const item = document.createDocumentFragment();

      const li = document.createElement("li");
      item.appendChild(li);

      span1 = document.createElement("span");
      span1.innerText = "文件：" + filename;

      const span2 = document.createElement("span");
      span2.innerHTML = `<em>移除</em>`;

      li.appendChild(span1);
      li.appendChild(span2);

      list.appendChild(item);
    } else {
      //第二次直接修改显示内容，避免重复创建节点
      span1.innerText = "文件：" + filename;
    }
  };
}

//验证是否处于可操作状态
export function checkIsDisable(element: HTMLElement) {
  return (
    element.classList.contains("disable") ||
    element.classList.contains("loading")
  );
}

export function disableHandle(
  flag: boolean,
  select?: HTMLButtonElement,
  upload?: HTMLButtonElement
) {
  if (!flag) {
    select?.classList.remove("disable");
    upload?.classList.remove("loading");
  } else {
    select?.classList.add("disable");
    upload?.classList.add("loading");
  }
}

//把文件读取成base64
export function fileToBase64(file: File): Promise<FileReader["result"]> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (ev) => {
      resolve(ev.target?.result!);
    };
    fileReader.onerror = (ev) => {
      reject(ev.target?.error);
    };
  });
}

//把文件读成buffer格式
export function fileToArrayBuffer(file: File): Promise<FileReader["result"]> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (ev) => {
      resolve(ev.target?.result!);
    };

    fileReader.onerror = (ev) => {
      reject(ev.target?.error);
    };

    fileReader.onprogress=(ev)=>{
      console.log((ev.loaded/ev.total*100).toFixed(2)+'%')
    }
  });
}

//文件经过md5生成唯一的hash
export function arrayBufferToHash(arrayBuffer: ArrayBuffer) {
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(arrayBuffer);
  return spark.end();
}

//获取文件后缀
export function getExtension(str:string){
  return /\.([A-z0-9]+)$/.exec(str)![0]
}
