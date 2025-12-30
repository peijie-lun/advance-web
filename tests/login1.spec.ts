//console.log('TEST_EMAIL raw:', JSON.stringify(process.env.TEST_EMAIL));
//console.log('TEST_PASSWORD raw:', JSON.stringify(process.env.TEST_PASSWORD));
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  //const testEmail = process.env.TEST_EMAIL || '';
  //const testPassword = process.env.TEST_PASSWORD || '';
  
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: '登入' }).click();
  await page.getByRole('textbox', { name: 'Email 地址' }).click();
  await page.getByRole('textbox', { name: 'Email 地址' }).click();
  await page.getByRole('textbox', { name: 'Email 地址' }).fill('s363157@gmail.com');
  await page.getByRole('textbox', { name: '密碼' }).click();
  await page.getByRole('textbox', { name: '密碼' }).fill('123456');
  await page.getByRole('button', { name: '登入' }).click();
  await page.getByRole('button', { name: '前往' }).first().click();
  await page.getByRole('button', { name: 'add' }).click();
  await page.getByRole('textbox', { name: '商品名稱' }).click();
  await page.getByRole('textbox', { name: '商品名稱' }).fill('1234');
  await page.getByRole('spinbutton', { name: '金額' }).click();
  await page.getByRole('spinbutton', { name: '金額' }).fill('44');
  await page.getByRole('textbox', { name: '商品連結' }).click();
  await page.getByRole('textbox', { name: '商品連結' }).click();
  await page.getByRole('textbox', { name: '商品連結' }).fill('123');
  await page.getByRole('button', { name: '確認儲存' }).click();
  await page.getByText('0s363157主頁登出').click();
  await page.getByRole('button', { name: '登出' }).click();
  await page.getByRole('textbox', { name: 'Email 地址' }).click();
});