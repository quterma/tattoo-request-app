// Глобальный CSS (side-effect импорт: import "./globals.css")
declare module "*.css"

// CSS Modules
declare module "*.module.css" {
  const classes: { [key: string]: string }
  export default classes
}

// Глобальный SCSS (side-effect импорт)
declare module "*.scss"

// SCSS Modules
declare module "*.module.scss" {
  const classes: { [key: string]: string }
  export default classes
}