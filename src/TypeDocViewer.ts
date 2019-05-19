import * as JWF from 'javascript-window-framework'


export namespace TYPEDOC {
	/**
	 *TypeDocのJSON処理用
	*
	* @export
	* @interface TypeDoc
	*/
	export interface TypeDoc {
		id: number;
		name: string;
		kind: number;
		kindString: string;
		flags: Flags;
		originalName?: string;
		children: TypeDoc[];
		groups: Group[];
		sources?: Source[];
		comment?: Comment;
		extendedTypes?: Type[];
		signatures?: Signature[];
		overwrites?: Type;
		type?: Type;
		inheritedFrom?: Type;
		defaultValue?: string;
	}
	interface ElementType {
		type: string;
		name?: string;
		types?: Type[];
	}

	interface Signature {
		id: number;
		name: string;
		kind: number;
		kindString: string;
		flags: Flags;
		type: Type;
		comment?: Comment;
		parameters?: Parameter[];
		overwrites?: Type;
		inheritedFrom?: Type;
	}
	interface Parameter {
		id: number;
		name: string;
		kind: number;
		kindString: string;
		flags: Flags;
		type: Type;
		comment?: Comment;
	}
	interface Group {
		title: string;
		kind: number;
		children: number[];
	}

	interface Type {
		type: string;
		name?: string;
		id?: number;
		types?: Type[];
		value?: string;
		declaration?: Declaration;
		elementType?: ElementType;
	}
	interface Comment {
		text?: string
		shortText: string;
		tags?: Tag[];
		returns?: string;
	}

	interface Declaration {
		id: number;
		name: string;
		kind: number;
		kindString: string;
		flags: Flags;
		signatures: Signature[];
		sources: Source[];
	}

	interface Source {
		fileName: string;
		line: number;
		character: number;
	}



	interface Flags {
		isOptional?: boolean;
		isStatic?: boolean;
		isExported?: boolean;
		isPrivate?: boolean;
	}

	interface Tag {
		tag: string;
		text: string;
	}

}
/**
 *ボタン表示用
 *
 * @class Button
 * @extends {JWF.Window}
 */
class Button extends JWF.Window {
	nodeText: HTMLElement
	constructor(text?: string) {
		super()
		this.setMargin(1, 1, 1, 1)
		this.setAutoSize(true)
		let node = this.getClient()
		node.dataset.kind = 'JButton'

		let nodeText = document.createElement('span')
		nodeText.style.whiteSpace = 'nowrap'
		node.appendChild(nodeText)
		this.nodeText = nodeText
		if (text)
			this.setText(text)
	}
	setText(text: string) {
		let nodeText = this.nodeText
		nodeText.textContent = text
		this.layout()
	}
}

/**
 *検索用
 *
 * @class SearchWindow
 * @extends {JWF.ListView}
 */
class SearchWindow extends JWF.ListView {
	constructor(treeView: JWF.TreeView, docData: TYPEDOC.TypeDoc, keywords: string) {
		super({ frame: true })
		this.setSize(600, 500)
		this.setTitle('Search')
		this.addHeader('検索結果')
		if (docData == null)
			return

		this.addEventListener('itemClick', e=> {
			let index = e.itemIndex
			let item = this.getItemValue(index) as JWF.TreeItem
			item.selectItem(true)
		})

		let keys = keywords.toLowerCase().split(' ')
		this.findItems(treeView.getRootItem(), keys)

	}
	findItems(item: JWF.TreeItem, keys:string[]) {
		let doc: TYPEDOC.TypeDoc = item.getItemValue()
		let word = doc.name;
		if (doc.signatures && doc.signatures[0]) {
			let signature = doc.signatures[0]
			if (signature.parameters && doc.signatures[0].parameters) {
				for (let p of doc.signatures[0].parameters) {
					word += ' ' + p.name
				}
			}
			if (signature.comment && signature.comment.shortText) {
				word += ' ' + signature.comment.shortText
			}
		}

		if (SearchWindow.findKeys(word.toLowerCase(), keys)) {
			let i:JWF.TreeItem|null = item
			let label = i.getItemText()
			while (i = i.getParentItem()) {
				label += ' - ' + i.getItemText()
			}

			let index = this.addItem(label)
			this.setItemValue(index, item)
		}
		for (let i = 0, l = item.getChildCount(); i < l; i++) {
			this.findItems(item.getChildItem(i), keys)
		}
	}
	static findKeys(value: string, keys: string[]) {
		for (let key of keys) {
			if (value.indexOf(key) === -1)
				return false
		}
		return true
	}
}
/**
 *TypeDocViewerのメインウインドウ
 *
 * @class TypeDocView
 * @extends {JWF.FrameWindow}
 */
export class TypeDocView extends JWF.Window {
	mTreeView: JWF.TreeView
	mListView: JWF.ListView
	mDocData: TYPEDOC.TypeDoc|null
	constructor(param?: JWF.WINDOW_PARAMS) {
		const onSearch = ()=>{
			if (this.mDocData){
				const search = new SearchWindow(this.mTreeView, this.mDocData, textBox.getText())
				this.addChild(search)
				search.setPos()
			}
		}

		super(param)
		this.mDocData = null
		this.setTitle('TypeDoc Viewer')
		this.setSize(800, 600)

		const panel = new JWF.Panel()
		this.addChild(panel, 'top')
		const searchButton = new Button('Search')
		panel.addChild(searchButton, 'left')
		searchButton.addEventListener('click', function (e) {
			onSearch()
		})
		const textBox = new JWF.TextBox()
		textBox.setMargin(1, 1, 1, 1)
		textBox.getTextNode().style.backgroundColor = '#dddddd'
		panel.addChild(textBox, 'client')
		textBox.addEventListener('enter', function (e) {
			onSearch()
		})

		const splitter = new JWF.Splitter()
		this.addChild(splitter, 'client')
		splitter.setSplitterPos(200)

		const treeView = new JWF.TreeView()
		this.mTreeView = treeView
		splitter.addChild(0, treeView, 'client')
		treeView.addEventListener('itemSelect', this.onTreeItem.bind(this))

		const listView = new JWF.ListView()
		this.mListView = listView
		splitter.addChild(1, listView, 'client')

		listView.addHeader([['項目', 100], ['値', 800]])
		this.setPos()
	}

	loadUrl(url:string) {
		const that = this
		//Ajaxによるデータ要求処理
		let xmlHttp = new XMLHttpRequest()
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState == 4) {
				let value = JSON.parse(xmlHttp.responseText)
				that.load(value)

			}
		}.bind(this)
		xmlHttp.open('GET', url, true)
		xmlHttp.send()
	}
	load(value: TYPEDOC.TypeDoc) {
		this.mDocData = value
		TypeDocView.createTree(this.mTreeView.getRootItem(), value)
	}
	static createTree(item: JWF.TreeItem, value: TYPEDOC.TypeDoc) {
		item.setItemText(value.name)
		item.setItemValue(value)

		const fromName = this.getInheritedFrom(value)
		if (fromName) {
			item.getBody().style.color = '#888822'
		}


		if (value.children) {
			const children = ([] as TYPEDOC.TypeDoc[]).concat(value.children)
			children.sort(function (a, b) {
				if (a.kindString !== b.kindString)
					return a.kindString < b.kindString ? -1 : 1
				return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
			})
			for (let i in children) {
				if (!children[i].flags.isPrivate) {
					let childItem = item.addItem()
					TypeDocView.createTree(childItem, children[i])
				}

			}
		}
	}
	static getInheritedFrom(value: TYPEDOC.TypeDoc) {
		if (value.inheritedFrom) {
			return value.inheritedFrom.name
		}
		return null
	}

	onTreeItem(e: JWF.TREEVIEW_EVENT_SELECT) {
		const item = e.item
		const listView = this.mListView
		const value = item.getItemValue() as TYPEDOC.TypeDoc

		listView.clearItem()
		if (value.kindString) {
			listView.addItem(['種別', value.kindString])
		}
		if (value.defaultValue) {
			listView.addItem(['初期値', value.defaultValue])
		}
		let comment = value.comment
		let signature = value.signatures && value.signatures[0]?value.signatures[0]:null
		if (!comment && signature)
			comment = signature.comment
		if (comment) {
			if (comment.shortText)
				listView.addItem(['説明', comment.shortText])
			if (comment.returns && signature) {
				const type = (signature.type && signature.type.name) ? signature.type.name : ''
				listView.addItem(['戻り値', '{' + type + '} ' + comment.returns])
			}
		}
		if (signature){
			if (signature.inheritedFrom && signature.inheritedFrom.name) {
				listView.addItem(['継承', signature.inheritedFrom.name])
			}
			if (signature.parameters) {
				const params = signature.parameters
				for (let i in params) {
					const param = params[i]
					const comment = (param.comment && param.comment.text) ? param.comment.text : ''
					const type = (param.name && param.type.name) ? param.type.name : ''

					listView.addItem(["[" + param.name + "]", '{' + type + '} ' + comment])
				}
			}
		}


	}
}
