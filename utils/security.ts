const { reverse } from 'dns/promises';

export async function sourceMatchesHostname(address: string, hostnames: string[]): Promise<boolean> {
  let reversed: string[];
  try {
    reversed = await reverse(address);
  } catch (err: Error) { // dns-related error
    console.error(err.message);
    return false;
  }
  return hostnames.some((hostname: string) => reversed.indexOf(hostname) > -1);
}
