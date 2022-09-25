const UUID_REGEX: string = '\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}';

export function extractNamesFromKeyName(keyName: string): [string, string] {
  const re: string = `^(.*)${UUID_REGEX}(.*)$`;
  const matches = keyName.match(re);
  if (matches) {
    return [matches[1], matches[2]];
  } else {
    throw new Error(`Can't parse Module name and Namespace name from [${keyName}].`);
  }
}
