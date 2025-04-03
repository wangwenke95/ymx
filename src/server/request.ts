import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';

const alova = createAlova({
    requestAdapter: adapterFetch(),
    responded: response => response.json()
});