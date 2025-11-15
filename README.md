# DogeCloud CDN Action

使用 GitHub Action 刷新多吉云 CDN 缓存

![DogeCloud CDN Action](.github/assets/dogecloud-cdn-action.png)

## 🚀 用法示例

刷新 `https://example.com/assets/js/` 和 `https://example.com/assets/css/` 目录的缓存：

```yaml
- name: "刷新多吉云 CDN 缓存"
  uses: seatonjiang/dogecloud-cdn-action@main
  with:
    access_key: ${{ secrets.DOGECLOUD_ACCESS_KEY }}
    secret_key: ${{ secrets.DOGECLOUD_SECRET_KEY }}
    type: "path"
    urls: 
      - "https://example.com/assets/js/"
      - "https://example.com/assets/css/"
```

刷新 `https://example.com/assets/index.js` 和 `https://example.com/assets/index.css` 文件的缓存：

```yaml
- name: "刷新多吉云 CDN 缓存"
  uses: seatonjiang/dogecloud-cdn-action@main
  with:
    access_key: ${{ secrets.DOGECLOUD_ACCESS_KEY }}
    secret_key: ${{ secrets.DOGECLOUD_SECRET_KEY }}
    type: "url"
    urls: 
      - "https://example.com/assets/index.js"
      - "https://example.com/assets/index.css"
```

> 提示：`access_key`、`secret_key` 需要使用 GitHub Secrets 存储，避免明文暴露在代码中。

## 📚 参数说明

| 参数 | 是否必填 | 描述 |
| :---: | :---: | ---- |
| `access_key` | 是 | AccessKey，可以在「[多吉云 - 用户中心 - 密钥管理](https://console.dogecloud.com/user/keys)」中获取 |
| `secret_key` | 是 | SecretKey，可以在「[多吉云 - 用户中心 - 密钥管理](https://console.dogecloud.com/user/keys)」中获取 |
| `type` | 是 | 刷新类型，可选值为 `path` 或 `url` |
| `urls` | 是 | 需要刷新的文件或目录列表 |

## 💖 项目支持

如果这个项目为你带来了便利，请考虑为这个项目点个 Star 或者通过微信赞赏码支持我，每一份支持都是我持续优化和添加新功能的动力源泉！

<div align="center">
    <b>微信赞赏码</b>
    <br>
    <img src=".github/assets/wechat-reward.png" width="230">
</div>

## 🤝 参与共建

我们欢迎所有的贡献，你可以将任何想法作为 [Pull Requests](https://github.com/seatonjiang/dogecloud-cdn-action/pulls) 或 [Issues](https://github.com/seatonjiang/dogecloud-cdn-action/issues) 提交。

## 📃 开源许可

项目基于 MIT 许可证发布，详细说明请参阅 [LICENSE](https://github.com/seatonjiang/dogecloud-cdn-action/blob/main/LICENSE) 文件。
