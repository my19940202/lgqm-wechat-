
const signinForm = document.querySelector('#select-form');
const articleWrapper = document.querySelector('.history-article');
const modal = document.querySelector('#modal');
const modalBtn = document.querySelector('#ok-btn');


// 邮箱和密码登入
function handleSubmit(event) {
    
}

articleWrapper.addEventListener('click', () => {
    modal.showModal();
});

// $$.cancelBtn.addEventListener('click', () => {
// $$.modal.close('Cancelled by click button')
// })

modalBtn.addEventListener('click', () => {
    modal.close('Ok')
});
