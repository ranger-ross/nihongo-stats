// Allow Typescript to use Vite style asset imports

declare module "*.png" {
    const value: string;
    export default value;
}


declare module "*.txt" {
  const value: string;
  export default value;
}

declare module "*?raw" {
  const value: string;
  export default value;
}

