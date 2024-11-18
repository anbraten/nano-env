type ModuleOptions = {
  thisProgram: string;
  arguments: string[];
  print: (...args: unknown[]) => void;
  printErr: (...args: unknown[]) => void;
  preInit: () => void;
};

type Module = ModuleOptions & {};

declare function loadModule(_: ModuleOptions): Promise<Module>;
export default loadModule;
