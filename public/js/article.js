
const signinForm = document.querySelector('#select-form');

// 邮箱和密码登入
function handleSubmit(event) {
    event.preventDefault();
    const apiToken = signinForm.querySelector('[name="apiToken"]').value;
    const model = signinForm.querySelector('[name="model"]').value;
    const nickname = signinForm.querySelector('[name="name"]').value;

    alert(['apiToken=', apiToken,  'model=', model, 'nickname=', nickname].join(' '));
    window.location.href = 'http://baidu.com/';
}

function handleSelect(e) {
    const select = e.target;
    const span = document.querySelector('#select-text');
    span.innerHTML = select.options[select.selectedIndex].value;
    console.log('eee', select.options[select.selectedIndex].value);
}
