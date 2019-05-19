import * as TypeDoc from './TypeDocViewer'

//ページ読み込み時に実行する処理を設定
addEventListener("DOMContentLoaded", docMain)
//ページ読み込み後に実行される内容
function docMain() {
	let typeDocView = new TypeDoc.TypeDocView({ frame: false }) //trueにするとフレームウインドウで表示
	//typeDocView.setSize(640,480)	//サイズ指定
	typeDocView.setOverlap(true)
	typeDocView.setMaximize(true)	//最大化(サイズを指定したければコメントアウトすること)

	typeDocView.loadUrl('./doc/document.json')	//TypeDocのJSONデータのURLを指定
	//var doc = (global as any)["doc"] as TypeDoc.TYPEDOC.TypeDoc
	//typeDocView.load(doc)		//こちらはローカルからでも実行可能
}