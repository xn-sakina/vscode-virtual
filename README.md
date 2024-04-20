# VSCode Virtual

Customize your vscode styles.

### Config

```ts
{
  "vscode-virtual.styles": [
    // url
    "https://domain.com/style.css",

    // local file
    // "file:///Users/name/Documents/style.css"
  ],

  // You can temp disable this plugin (Default: true)
  "vscode-virtual.enabled": true
}
```

if your file content has changed, use VSCode command `VSCode Virtual: Reload styles` to reload the style.

NOTE: style changes require reloading VSCode to work.

### Demo

Customize the VSCode start page logo:

```ts
{
  "vscode-virtual.styles": [
    "https://gist.githubusercontent.com/fz6m/62e4f36cdf7ec8108d5e11ed9bec007b/raw/6f98a62f5d002d3555be351a22c4d74c71726706/logo.css"
  ]
}
```

<img src='https://cdn.jsdelivr.net/gh/fz6m/Private-picgo@moe-2024/img/202404201638547.png' width='60%' />

this image from: [`ProgrammingVTuberLogos`](https://github.com/Aikoyori/ProgrammingVTuberLogos/blob/main/VSCode/VSCode.png)

### Thanks/Inspiration

 - [vscode-background](https://github.com/shalldie/vscode-background) : Bring background images to your vscode.
