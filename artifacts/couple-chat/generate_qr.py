import qrcode

url = 'exp://192.168.0.28:19000'
img = qrcode.make(url)
img.save('qr_exp_local.png')
print('QR saved to qr_exp_local.png')
