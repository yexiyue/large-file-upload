import { checkIsDisable, getUploadDom } from "../utils";
import { uploadSingleProgress } from "../api";

const { select, input, list, upload } = getUploadDom("upload5");

let _file: File[] = [];

//1.点击选择按钮触发input的文件选择行为
select?.addEventListener("click", () => {
  //当图片在上传时，阻止选择图片
  if (checkIsDisable(select)) {
    return;
  }
  input.click();
});

//2.监听用户选择的文件
input.addEventListener("change", () => {
  const file = input.files;
  //如果没文件就返回，下面代码不执行
  if (file?.length === 0) return;

  //保存文件
  _file = Array.from(file!);

  //3.显示上传的文件在列表中
  let str = ``;
  _file.forEach((item, index) => {
    str += `<li key='${item.name}'>
    <span>文件${index + 1}：${item.name}</span>
    <span><em>移除</em></span>
</li>`;
  });
  list.innerHTML = str;
  list.style.display = "block";
});

//4.移除按钮的点击处理
list.addEventListener("click", (ev) => {
  //使用事件委托机制,对动态绑定的事件处理比较容易
  let target = ev.target as HTMLElement;

  if (target.tagName === "EM") {
    //如果事件源是em就进行移除
    const li = target.parentNode?.parentNode as HTMLElement;
    const key = li.getAttribute("key");
    li.parentNode?.removeChild(li);
    _file.splice(
      _file.findIndex((item) => item.name === key),
      1
    );

    if (_file.length === 0) {
      list.style.display = "none";
    }
  }
});

//5.上传按钮上传文件
upload?.addEventListener("click", async () => {
  //当图片在上传时，阻止上传图片
  if (checkIsDisable(upload)) {
    return;
  }

  if (_file.length === 0) {
    alert("请选择要上传的文件");
    return;
  }

  //6.设置按钮样式
  disableHandle(true);

  //获取li
  let liArr = Array.from(list.querySelectorAll("li"));

  //循环发送请求
  let requests = _file.map((item) => {
    const li = liArr.find((l) => l.getAttribute("key") === item.name);
    const span = li?.children[1];
    return uploadSingleProgress(item, ({ loaded, total }) => {
      span!.innerHTML = `${((loaded / total!) * 100).toFixed(2)}%`;
    }).then((res) => {
      if (res.data.code === 0) {
        span!.innerHTML = "100%";
        return;
      }
      return Promise.reject(res.data);
    });
  });

  //等待所有处理结果
  Promise.all(requests)
    .then(() => {
      alert("所有文件上传成功");
    })
    .catch((err) => {
      alert(JSON.stringify(err));
    })
    .finally(() => {
      disableHandle(false);
      _file=[]
      list.style.display = "none";
      list.innerHTML = "";
      input.files=null
    });
});

function disableHandle(flag: boolean) {
  if (!flag) {
    select.classList.remove("disable");
    upload?.classList.remove("loading");
  } else {
    select.classList.add("disable");
    upload?.classList.add("loading");
  }
}
