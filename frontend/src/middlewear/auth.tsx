// LOGIN STATUS
export const isLogin = () => {
    if (localStorage.getItem('userInfo')) return true;
    return false;
}