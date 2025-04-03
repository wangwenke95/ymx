<!-- 修改模板部分（保持结构不变，只添加class） -->
<template>
  <div class="main-box">
    <div class="container">
      <h1>周订单统计系统</h1>

      <!-- 文件上传 -->
      <div class="upload-section">
        <label class="custom-file-upload">
          <input type="file" @change="handleFileUpload" accept=".xlsx"/>
          上传Excel文件
        </label>
        店铺筛选：
        <select @change="getSelectStoreName">
          <option v-for="(item, index) in storeName" :key="index" :value="index">{{ item }}</option>
        </select>
      </div>

      <!-- 统计结果展示 -->
      <div v-if="results" class="results">
        <h2>统计结果</h2>
        <p class="total-orders">有效订单数: {{ totalOrders }}</p>

        <table>
          <thead>
          <tr>
            <th>币种</th>
            <th>总销售额（原币种）</th>
            <!--          <th>总销售额（USD）</th>-->
          </tr>
          </thead>
          <tbody>
          <tr v-for="(total, currency) in currencyTotals" :key="currency">
            <td>{{ currency }}</td>
            <td>{{ total.original.toFixed(2) }}</td>
            <!--          <td>{{ total.usd.toFixed(2) }}</td>-->
          </tr>
          </tbody>
        </table>
      </div>


    </div>
    <div class="iframe-box">
      <iframe src="https://www.amz123.com/tools-exchangepage"
              sandbox="allow-same-origin allow-scripts"></iframe>
    </div>

  </div>

</template>

<script>
import {read, utils} from 'xlsx';
// import req from '../server/request.ts'
export default {
  data() {
    return {
      storeName: [],
      selectedStore: "全部",  // 默认显示全部店铺
      rawData: [],
      filteredData: [],
      currencyTotals: {},
      totalOrders: 0,
      // 汇率配置（示例汇率，实际使用时建议动态获取）
      exchangeRates: {
        CAD: 0.695,   // 1 CAD = 0.695 USD
        AUD: 0.632,   // 1 AUD = 0.632 USD
        MXN: 0.0504,  // 1 MXN = 0.0504 USD
        JPY: 0.006,   // 1 JPY= 0.006
        USD: 1       // USD自身汇率
      }
    }
  },
  computed: {
    results() {
      return this.totalOrders > 0
    }
  },
  mounted() {
    // //在线获取汇率api
    // // 定义获取汇率的函数
    // async function fetchExchangeRate() {
    //   // const url = 'https://api.frankfurter.app/latest?from=USD';
    //   // const a=req.alova(url) ;
    //   alert("123")
    // }
    // fetchExchangeRate();
  },
  methods: {

    // 获取复选框店铺名
    getSelectStoreName(event) {
      this.selectedStore = this.storeName[event.target.selectedIndex]; // 更新选中的店铺
      this.processData(); // 重新计算数据
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 读取Excel文件
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, {header: 1});
      this.storeName = ["全部"]
      // 处理表头
      const headers = jsonData[0].map(h => h.trim());
      this.rawData = jsonData.slice(1).map(row => {
        return headers.reduce((obj, key, index) => {
          // 处理产品售价中的<br>和空值
          let value = row[index];
          let sum = 0;
          // 加载表里店铺名称到多选----
          const storeNameIndex = this.findRowTitle(headers, "店铺账号")
          // 检查 storeName 数组中是否已存在 storeNameValue
          let storeNameNew = row[storeNameIndex].replace(/-[^-]+$/, "") //只保留运营人员名称和店铺名称，去掉国家名称
          if (!this.storeName.some(item => item === storeNameNew)) {
            this.storeName.push(storeNameNew); // 追加数据
            // console.log(this.storeName); // 输出数组
          }
          // 加载表里店铺名称到多选----结束
          const productsTotalIndex = this.findRowTitle(headers, '产品总数')//产品总数表头下标
          if (key === '产品售价') {
            if (row[index] !== row[productsTotalIndex]) {
              if (typeof value === 'string' && (value.includes('\n') || value.includes('<br>'))) {
                const a = value.split('\n').map(v => parseFloat(v.trim()) || 0);
                //判断多个产品售价的数量是否符合订单数量
                if (a.length === row[productsTotalIndex]) {
                  // console.log("相符")
                  value = a.reduce((acc, num) => acc + num, 0);
                  // console.log('sum:'+sum)
                  // console.log(检测到多行数据: ${value});
                }
              } else {
                value = row[index] * row[index + 1]
                // console.log(row[index]+"---"+row[index+1]+"="+value)
              }
            }
            // 加运费
            const bpsIndex = this.findRowTitle(headers, '买家支付运费')//运费表头下标
            if (row[bpsIndex]) {
              value += row[bpsIndex]
            }

            value = parseFloat((value || '').toString().replace(/<br>/g, '')) || 0;
          }
          obj[key] = value;
          return obj;
        }, {});
      });

      this.processData();
    },

    // 通过表头名称寻找下标
    findRowTitle(Arrays, Key) {
      const index = Arrays.findIndex(item =>
          typeof item === "string" && item.toLowerCase().includes(Key)
      );
      if (index)
        return index
    },


    processData() {
      const validStatus = ['待打单（有货）', '已处理', '已发货'];

      // **按店铺筛选数据**
      this.filteredData = this.rawData.filter(item => {
        const isValidOrder = validStatus.includes(item['订单状态']);
        const isMatchingStore = this.selectedStore === "全部" ||
            item['店铺账号'].includes(this.selectedStore); // 只筛选选中的店铺
        return isValidOrder && isMatchingStore;
      });

      // 统计订单总数
      this.totalOrders = this.filteredData.length;

      // 按币种统计销售额
      this.currencyTotals = this.filteredData.reduce((acc, item) => {
        const currency = item['币种缩写'];
        const price = parseFloat(item['产品售价']) || 0;
        const rate = this.exchangeRates[currency] || 1;

        if (!acc[currency]) {
          acc[currency] = { original: 0, usd: 0 };
        }

        acc[currency].original += price;
        acc[currency].usd += price * rate;

        return acc;
      }, {});
    }

  }
}
</script>

<style>
:root {
  --primary-color: #4da853;
  --secondary-color: #6c757d;
  --background-color: #f8f9fa;
  --text-color: #2c3e50;
  --border-color: #dee2e6;
}

.main-box {
  overflow: hidden;
  display: flex;
  min-height: 100vh;
  width: 100vw;
  height: 100Vh;
}

.container {
  background: var(--background-color);
  padding: 20px;
  width: 35%;
  height: 100Vh;
}
.iframe-box{
  margin-left: 10px;
  width: 65%;
  iframe{
    width: 100%;
    height: 100%;
  }
}


h1 {
  color: var(--primary-color);
  font-size: 2.2rem;
  margin-bottom: 2rem;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

/* 文件上传区域美化 */
.upload-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

input[type="file"] {
  display: none;
}

.custom-file-upload {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 1rem;
}

.custom-file-upload:hover {
  background: #3d8b47;
  transform: translateY(-1px);
}

/* 下拉菜单美化 */
select {
  padding: 0.8rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: white;
  width: 250px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(77,168,83,0.2);
}

/* 统计结果区域 */
.results {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

h2 {
  color: var(--text-color);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

/* 表格美化 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

th {
  background: var(--primary-color);
  color: white;
  padding: 1rem;
  font-weight: 600;
  text-align: left;
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

tr:hover {
  background-color: #e9f5eb;
  transition: background 0.3s;
}

/* 有效订单数样式 */
.total-orders {
  font-size: 1.4rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* iframe容器美化 */
iframe {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 500px;
  background: white;
}
</style>