// 模拟商品数据
const products = {
    1: { name: "老板亲选 · 破壁灵芝孢子粉", price: "598", desc: "源头直供 | 破壁率99% | 增强免疫", img: "assets/tcm/lingzhi_product_premium_1768659574726.png" },
    2: { name: "长白山特级灵芝切片", price: "128", desc: "野生抚育 | 煲汤首选 | 滋补养生", img: "assets/tcm/tcm_herbs_art_v2_1768660271435.png" },
    3: { name: "灵芝养生茶饮包", price: "59", desc: "上班族首选 | 护肝明目 | 独立包装", img: null, icon: 'fa-mug-hot' },
    4: { name: "手工东阿阿胶糕", price: "198", desc: "补气养血 | 传统工艺 | 0添加", img: null, icon: 'fa-cookie' },
    5: { name: "进口西洋参切片", price: "268", desc: "美国进口 | 软枝切片 | 清火生津", img: null, icon: 'fa-leaf' }
};

let pageHistory = [];

function switchTab(tabId) {
    // 记录历史（为了简单的返回逻辑）
    // 实际中底部导航不需要记录历史，但详情页需要
    // 这里只处理页面切换
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none'); // 先全部隐藏

    const target = document.getElementById(tabId);
    if (target) {
        target.style.display = 'block';
        if (tabId === 'home' || tabId === 'category' || tabId === 'knowledge' || tabId === 'profile') {
            // 更新底部导航状态
            document.querySelectorAll('.tab-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('onclick').includes(tabId)) {
                    item.classList.add('active');
                }
            });
            // 它是主Tab，清空返回栈
            pageHistory = [];
        }
    }
}

function openProduct(id) {
    const p = products[id];
    if (!p) return;

    // 填充数据
    document.getElementById('detail-title').innerText = p.name;
    document.getElementById('detail-price').innerText = p.price;
    document.getElementById('detail-desc').innerText = p.desc;

    // 填充图片
    const imgContainer = document.getElementById('detail-img');
    if (p.img) {
        imgContainer.style.backgroundImage = `url('${p.img}')`;
        imgContainer.innerHTML = '';
    } else {
        imgContainer.style.backgroundImage = 'none';
        imgContainer.style.backgroundColor = '#f5f5f5';
        imgContainer.innerHTML = `<i class="fas ${p.icon}" style="font-size: 80px; color: #D4B185; position: absolute; top:50%; left:50%; transform: translate(-50%, -50%);"></i>`;
    }

    // 记录当前页面，用于返回
    // 简单堆栈：如果不为空，说明是从某个页面来的
    // 实际中我们直接显示详情页覆盖在上面
    const detailPage = document.getElementById('product-detail');
    detailPage.style.display = 'block';

    // 把其他页面隐藏吗？不，覆盖模式更好看，或者简单点隐藏
    // 为了简单，我们隐藏所有，只显示 detail
    document.querySelectorAll('.page').forEach(p => {
        if (p.id !== 'product-detail') p.style.display = 'none';
    });

    pageHistory.push('home'); // 假设都是从首页来的，稍微偷懒
}

function openArticle(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById('article-detail').style.display = 'block';
    pageHistory.push('knowledge'); // 假定来源
}

function goBack() {
    // 简单的返回逻辑：默认回首页，或者根据历史
    const last = pageHistory.pop() || 'home';
    switchTab(last);
    // 隐藏详情页
    document.getElementById('product-detail').style.display = 'none';
    document.getElementById('article-detail').style.display = 'none';
}

function addToCart() {
    alert('已成功加入购物车！');
}

// 模拟分类切换
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        // 右侧内容本来应该变，这里仅做 UI 响应
    });
});

window.addEventListener('load', () => {
    switchTab('home'); // 初始化显示首页
    console.log('App Ready');
});
