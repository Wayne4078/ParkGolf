// 토스 앱 안에서만 쓰는 연결부. 웹(github.io)에는 이 파일이 들어가지 않는다.
import { graniteEvent, loadFullScreenAd, showFullScreenAd, IAP, closeView, Environment, Analytics, Notification, SafeAreaInsets } from '@apps-in-toss/web-framework';
window.AIT = { graniteEvent, loadFullScreenAd, showFullScreenAd, IAP, closeView, Environment, Analytics, Notification, SafeAreaInsets };
// 콘솔에서 발급받으면 채운다. 비어 있으면 게임은 시험용 화면으로 대신한다.
window.AIT_CFG = { ad: 'ait.v2.live.b2eca3ba336c4c18', sku: 'ait.0000098747.fdf5c707.660136df0b.4386532557' };
