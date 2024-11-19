export type CommandOption<T> = {
  short: string;
  option?: string;
  description?: string;
  apply: (ctx: T) => T;
};

export function getCommandOptions<T>(
  args: string[],
  context: T,
  ...options: CommandOption<T>[]
): [T, string[]] {
  const shortOptions = args
    .filter((arg) => arg.startsWith('-'))
    .flatMap((a) => a.slice(1).split(''));
  if (shortOptions.length > 0) {
    shortOptions.forEach((opt) => {
      const option = options.find((o) => o.short === opt);
      if (option) {
        context = option.apply(context);
      } else {
        throw new Error(`Unknown option: -${opt}`);
      }
    });
  }

  const longOptions = args.filter((arg) => arg.startsWith('--'));
  if (longOptions.length > 0) {
    longOptions.forEach((opt) => {
      const option = options.find((o) => o.option === opt.slice(2));
      if (option) {
        context = option.apply(context);
      } else {
        throw new Error(`Unknown option: ${opt}`);
      }
    });
  }

  return [context, args.filter((arg) => !arg.startsWith('-'))];
}
