import { uploadSingleProgress } from "./../api";
import { getUploadDom, checkIsDisable } from "../utils";

const { select, input, progress } = getUploadDom("upload4");
const value = progress.children[0] as HTMLDivElement;

//1.点击选择按钮触发input的文件选择行为
select?.addEventListener("click", () => {
  //当图片在上传时，阻止选择图片
  if (checkIsDisable(select)) return;

  input.click();
});

//2.监听用户选择的文件
input.addEventListener("change", async () => {
  const file = input.files![0];
  //如果没文件就返回，下面代码不执行
  if (!file) return;

  disableHandle(true, select);
  try {
    const res = await uploadSingleProgress(file, (ev) => {
      progress.style.display = "block";
      value.style.width = ev.loaded / ev.total! * 100 + "%";
    });
    if (res.data.code === 0) {
      value.style.width = "100%";
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
      return alert(`文件上传成功，地址：${res.data.servicePath}`);
    }
    throw res.data;
  } catch (error) {
    alert(JSON.stringify(error));
  } finally {
    disableHandle(false, select);
    progress.style.display = "none";
    value.style.width = "0%";
    input.files = null;
  }
});

function disableHandle(flag: boolean, select: HTMLButtonElement) {
  if (!flag) {
    select.classList.remove("loading");
  } else {
    select.classList.add("loading");
  }
}
