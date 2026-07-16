import http from 'http';

const reqOutlets = http.request('http://localhost:5000/api/outlets', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const outletId = json.data[0]._id;
    
    // Find a quicktab ID
    const reqTabs = http.request('http://localhost:5000/api/quicktabs', (resTab) => {
      let dataTab = '';
      resTab.on('data', (chunk) => dataTab += chunk);
      resTab.on('end', () => {
        const tabsJson = JSON.parse(dataTab);
        const tabId = tabsJson.data[0]._id;
        console.log('Testing with QuickTab:', tabsJson.data[0].name, tabId);
        
        const reqProd = http.request(`http://localhost:5000/api/products?outletId=${outletId}&quickTab=${tabId}&limit=100`, (resProd) => {
          let dataProd = '';
          resProd.on('data', (chunk) => dataProd += chunk);
          resProd.on('end', () => {
            const prodJson = JSON.parse(dataProd);
            console.log('Returned products length:', prodJson.data.items.length);
            
            // Check if returned products actually have this quickTab
            let allMatch = true;
            for(const p of prodJson.data.items) {
              if(p.quickTab !== tabId) {
                console.log('MISMATCH!', p.name, 'has quickTab', p.quickTab);
                allMatch = false;
                break;
              }
            }
            if(allMatch) console.log('All returned products correctly match the quickTab!');
          });
        });
        reqProd.end();
      });
    });
    reqTabs.end();
  });
});
reqOutlets.end();
