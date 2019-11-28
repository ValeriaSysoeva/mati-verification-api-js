type btoaType = (str: string) => string;
type fetchType = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

interface Global extends NodeJS.Global {
  btoa: btoaType;
  FormData: FormData;
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

const btoa: btoaType = (global as Global).btoa
  ? (global as Global).btoa.bind(undefined)
  : ((str: string) => Buffer.from(str).toString('base64'));

// eslint-disable-next-line global-require
const FormData = (global as Global).FormData || require('form-data');

// eslint-disable-next-line global-require
const fetch: fetchType = (global as Global).fetch
  ? (global as Global).fetch
  : require('node-fetch');

export default {
  btoa,
  FormData,
  fetch,
};
