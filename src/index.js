import { getInput, info, setFailed, setOutput } from "@actions/core";
import { createHmac } from "crypto";

/**
 * 读取并校验输入参数
 *
 * @returns {{accessKey:string, secretKey:string, type:string, urls:string}}
 */
function getInputs() {
  const accessKey = getInput("access_key", { required: true });
  const secretKey = getInput("secret_key", { required: true });
  const type = getInput("type", { required: true });
  const urls = getInput("urls", { required: true });

  return { accessKey, secretKey, type, urls };
}

function parseUrlsInput(raw) {
  const s = String(raw || "").trim();
  if (s.length === 0) return [];
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        const cleaned = arr
          .map((x) => String(x))
          .map((x) => x.trim())
          .map((t) =>
            t
              .replace(/^\-+\s*/, "")
              .replace(/^`|`$/g, "")
              .replace(/^"|"$/g, "")
              .replace(/^'|'$/g, "")
              .trim()
          )
          .filter((x) => x.length > 0);
        return Array.from(new Set(cleaned));
      }
    } catch {}
  }
  const tokens = s.split(/\n+/).flatMap((line) => {
    const t = line.trim();
    if (t.includes(",") && !t.startsWith("-")) {
      return t.split(",");
    }
    return [t];
  });
  const cleaned = tokens
    .map((t) =>
      String(t)
        .replace(/^\-+\s*/, "")
        .replace(/^`|`$/g, "")
        .replace(/^"|"$/g, "")
        .replace(/^'|'$/g, "")
        .trim()
    )
    .filter((t) => t.length > 0);
  return Array.from(new Set(cleaned));
}

async function dogecloudApi(accessKey, secretKey, payload, options = {}) {
  const apiPath = "/cdn/refresh/add.json";
  const params = new URLSearchParams();
  params.set("rtype", payload.rtype);
  params.set("urls", JSON.stringify(payload.urls));
  const body = params.toString();
  const sign = createHmac("sha1", secretKey)
    .update(Buffer.from(apiPath + "\n" + body, "utf8"))
    .digest("hex");
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: "TOKEN " + accessKey + ":" + sign,
  };
  const timeoutMs = options.timeoutMs ?? 30000;
  const maxRetries = options.maxRetries ?? 2;
  let attempt = 0;
  // retry loop
  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch("https://api.dogecloud.com" + apiPath, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
      if (!resp.ok) {
        if (resp.status >= 500 && attempt < maxRetries) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        throw new Error(`${resp.status} ${resp.statusText}`);
      }
      const json = await resp.json();
      if (!json || json.code !== 200) {
        throw new Error(json && json.msg ? json.msg : "API Error");
      }
      return json.data;
    } catch (e) {
      if (attempt < maxRetries) {
        attempt += 1;
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * 主流程：创建刷新多吉云内容分发网络缓存任务
 *
 * @returns {Promise<void>}
 */
async function run() {
  try {
    const { accessKey, secretKey, type, urls } = getInputs();
    const t = String(type || "").toLowerCase();
    if (t !== "path" && t !== "url") {
      throw new Error('type 类型必须是 "path" 或 "url"');
    }
    const urlList = parseUrlsInput(urls);
    if (urlList.length === 0) {
      throw new Error("urls 不能为空");
    }
    const payload = { rtype: t, urls: urlList };
    info(`开始刷新 CDN 缓存，共 ${urlList.length} 个 URL`);
    const data = await dogecloudApi(accessKey, secretKey, payload, {
      timeoutMs: 30000,
      maxRetries: 2,
    });
    setOutput("result", JSON.stringify(data));
    info("刷新成功，请耐心等待节点同步！");
  } catch (err) {
    setFailed(err.message || String(err));
  }
}

run();
