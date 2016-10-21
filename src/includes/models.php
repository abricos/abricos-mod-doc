<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Interface DocSaveVars
 *
 * @property int $docid
 * @property string $title
 * @property string $miniTitle
 * @property array $childs
 */
interface DocSaveVars {
}

/**
 * Class DocSave
 *
 * @property DocSaveVars $vars
 * @property int $docid
 */
class DocSave extends AbricosResponse {
    const CODE_OK = 1;
    const CODE_EMPTY_TITLE = 2;

    protected $_structModule = 'doc';
    protected $_structName = 'DocSave';

    private $elResults = array();
    private $elMapResults = array();

    public function AddElementResult(DocElementSave $r){
        $this->elResults[] = $r;
        if ($r->elementid > 0){
            $this->elMapResults[$r->elementid] = $r;
        }
    }

    public function IsElementResult($elementid){
        return isset($this->elMapResults[$elementid]);
    }

    public function ToJSON(){
        $ret = parent::ToJSON();
        $ret->elements = array();

        for ($i = 0; $i < count($this->elResults); $i++){
            /** @var DocElementSave $es */
            $es = $this->elResults[$i];

            if ($es->IsSetCode(DocElementSave::CODE_NOT_CHANGED)){
                continue;
            }

            $ret->elements[] = $es->ToJSON();
        }

        return $ret;
    }

}

/**
 * Class Doc
 *
 * @property string $title
 * @property string $miniTitle
 * @property DocElementList $elementList
 * @property int $ord
 */
class Doc extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'Doc';

    public $extends = array();

    public function ToJSON(){
        $ret = parent::ToJSON();

        $ret->extends = new stdClass();
        foreach ($this->extends as $key => $value){
            $ret->extends->$key = $value->ToJSON();
        }

        return $ret;
    }

    public function GetName(){
        $title = str_replace(' ', '_', $this->title);

        return 'doc'.$this->id."-".urlencode($title);
    }

    public function GetURL(){
        $name = $this->GetName();
        return '/doc/'.$name."/";
    }

    public function GetElementURL($elementid){
        $url = $this->GetURL();

        $elementList = $this->elementList;

        $path = $elementList->GetPath($elementid);
        $count = count($path);

        for ($i = 0; $i < $count; $i++){
            $element = $elementList->Get($path[$i]);

            $title = str_replace(' ', '_', $element->title);

            $url .= 'el'.$element->id."-";
            $url .= urlencode($title)."/";
        }

        return $url;
    }

    public function GetEl($elementid){
        $element = $this->elementList->Get($elementid);
        if (empty($element)){
            return null;
        }
        /** @var DocElList $elList */
        $elList = $this->extends[$element->type];

        return $elList->Get($elementid);
    }

    public static function ParseURL(){
        $adr = Abricos::$adress;
        if ($adr->level <= 1){
            return 0;
        }
        $a = explode('-', $adr->dir[1]);
        if (count($a) < 2){
            return 0;
        }
        return intval(str_replace('doc', '', $a[0]));
    }

    public static function ParseElementURL(){
        $adr = Abricos::$adress;
        if ($adr->level <= 2){
            return 0;
        }
        $a = explode('-', $adr->dir[count($adr->dir) - 1]);
        if (count($a) < 2){
            return 0;
        }
        return intval(str_replace('el', '', $a[0]));
    }

}

/**
 * Class DocList
 *
 * @method Doc Get(int $id)
 * @method Doc GetByIndex(int $i)
 */
class DocList extends AbricosModelList {
}

/**
 * Class DocElementType
 *
 * @property string $id
 * @property string $template
 */
class DocElementType extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'ElementType';
}

/**
 * Class DocElementTypeList
 *
 * @method DocElementType Get(string $name)
 * @method DocElementType GetByIndex(int $i)
 */
class DocElementTypeList extends AbricosModelList {
}


/**
 * Class DocElement
 *
 * @property int $id Element ID
 * @property int $parentid
 * @property int $docid
 * @property string $title
 * @property bool $isAutoTitle Automatic generation of an abbreviated title
 * @property string $type Element Type
 * @property int $ord
 */
class DocElement extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'Element';

    public static function ItemClassName($type){
        return 'El'.ucfirst($type);
    }

    public static function ListClassName($type){
        return 'El'.ucfirst($type).'List';
    }
}

/**
 * Interface DocElementSaveVars
 *
 * @property int $elementid
 * @property int $clientid
 * @property string $type
 * @property string $title
 * @property bool $isAutoTitle
 * @property object $el
 * @property bool $changed
 * @property array $childs
 */
interface DocElementSaveVars {
}

/**
 * Class DocElementSave
 *
 * @property DocElementSaveVars $vars
 * @property int $elementid
 * @property int $parentid
 * @property int $clientid
 * @property int $ord
 */
class DocElementSave extends AbricosResponse {
    const CODE_OK = 1;
    const CODE_NOT_CHANGED = 2;

    protected $_structModule = 'doc';
    protected $_structName = 'ElementSave';

    /**
     * @var AbricosResponse
     */
    public $elResult;

    public function ToJSON(){
        $ret = parent::ToJSON();

        if (!empty($this->elResult)){
            $ret->el = $this->elResult->ToJSON();
        }
        return $ret;
    }
}

/**
 * Class DocElementList
 *
 * @method DocElement Get(int $elementid)
 * @method DocElement GetByIndex(int $i)
 */
class DocElementList extends AbricosModelList {

    public function GetPath($elementid){
        $elementid = intval($elementid);

        $path = array();

        while ($elementid > 0){
            $element = $this->Get($elementid);
            if (empty($element)){
                $path = array();
                break;
            }
            $path[] = $elementid;
            $elementid = $element->parentid;
        }

        $path = array_reverse($path);

        return $path;
    }
}

/**
 * Class DocEl
 *
 * @property int $id Element ID
 * @property int $docid
 */
abstract class DocEl extends AbricosModel {
    protected $_structModule = 'doc';
}

/**
 * Class DocElList
 *
 * @method DocEl Get(int $id)
 * @method DocEl GetByIndex(int $i)
 */
abstract class DocElList extends AbricosModelList {
}

/**
 * Class DocElText
 *
 * @property string $body
 */
class DocElText extends DocEl {
    protected $_structName = 'ElText';
}

/**
 * Class DocElTextList
 *
 * @method DocElText Get(int $id)
 * @method DocElText GetByIndex(int $i)
 */
class DocElTextList extends DocElList {
}

/**
 * Class DocElPage
 *
 * @property int $id Element ID
 * @property string $title
 */
class DocElPage extends DocEl {
    protected $_structName = 'ElPage';
}

/**
 * Class DocElPageList
 *
 * @method DocElPage Get(int $id)
 * @method DocElPage GetByIndex(int $i)
 */
class DocElPageList extends DocElList {
}

/**
 * Class DocElSection
 *
 * @property int $id Element ID
 * @property string $title
 */
class DocElSection extends DocEl {
    protected $_structName = 'ElSection';
}

/**
 * Class DocElSectionList
 *
 * @method DocElSection Get(int $id)
 * @method DocElSection GetByIndex(int $i)
 */
class DocElSectionList extends DocElList {
}

/**
 * Interface DocElTableSaveVars
 *
 * @property int $rowCount
 * @property int $colCount
 * @property bool $isCaption
 * @property bool $isBorder
 * @property bool $isHover
 * @property bool $isCondense
 * @property array $cells
 */
interface DocElTableSaveVars {
}

/**
 * Class DocElTableSave
 *
 * @property DocElTableSaveVars $vars
 * @property int $elementid
 */
class DocElTableSave extends AbricosResponse {
    const CODE_OK = 1;

    protected $_structModule = 'doc';
    protected $_structName = 'ElTableSave';

    public $cellResults = array();

    public function ToJSON(){
        $ret = parent::ToJSON();
        $ret->cells = array();

        for ($i = 0; $i < count($this->cellResults); $i++){
            /** @var DocElTableCellSave $cs */
            $cs = $this->cellResults[$i];

            $ret->cells[] = $cs->ToJSON();
        }

        return $ret;
    }
}


/**
 * Class DocElTable
 *
 * @property bool $isCaption
 * @property bool $isBorder
 * @property bool $isHover
 * @property bool $isCondense
 * @property int $rowCount
 * @property int $colCount
 * @property DocElTableCellList $cellList
 */
class DocElTable extends DocEl {
    protected $_structName = 'ElTable';
}

/**
 * Class DocElTableList
 *
 * @method DocElTable Get(int $id)
 * @method DocElTable GetByIndex(int $i)
 */
class DocElTableList extends DocElList {
}

/**
 * Interface DocElTableCellSaveVars
 *
 * @property int $cellid
 * @property int $clientid
 * @property int $row
 * @property int $col
 * @property string $type
 * @property string $body
 */
interface DocElTableCellSaveVars {
}

/**
 * Class DocElTableCellSave
 *
 * @property DocElTableCellSaveVars $vars
 * @property int $cellid
 * @property int $clientid
 */
class DocElTableCellSave extends AbricosResponse {
    const CODE_OK = 1;

    protected $_structModule = 'doc';
    protected $_structName = 'ElTableCellSave';
}

/**
 * Class DocElTableCell
 *
 * @property string $type simple|html|visual|container
 * @property int $col
 * @property int $row
 * @property string $body
 */
class DocElTableCell extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'ElTableCell';
}

/**
 * Class DocElTableCellList
 *
 * @method DocElTableCell Get(int $id)
 * @method DocElTableCell GetByIndex(int $i)
 */
class DocElTableCellList extends AbricosModelList {

    private $_mapCell = array();

    /**
     * @param DocElTableCell $item
     */
    public function Add($item){
        parent::Add($item);
        $row = $item->row;
        $col = $item->col;

        if (!isset($this->_mapCell[$row])){
            $this->_mapCell[$row] = array();
        }
        $this->_mapCell[$row][$col] = $item;
    }

    /**
     * @param int $row
     * @param int $col
     * @return DocElTableCell|null
     */
    public function Cell($row, $col){
        if (!isset($this->_mapCell[$row][$col])){
            return null;
        }
        return $this->_mapCell[$row][$col];
    }
}


/**
 * Class DocLink
 *
 * @property int $docid
 * @property string $docTitle
 * @property int $elementid
 * @property string $elType Element Type
 * @property array $elData
 * @property array $path
 * @property int $ord
 */
class DocLink extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'Link';

    /**
     * @var DocEl
     */
    public $el;

    public function __construct($d){
        $path = null;

        if (isset($d['pathCache']) && !empty($d['pathCache'])){
            $path = json_decode($d['pathCache']);
        }

        $d['path'] = $path;

        parent::__construct($d);
    }

    public function ToJSON(){
        $ret = parent::ToJSON();

        $ret->el = $this->el->ToJSON();

        return $ret;
    }
}

/**
 * Class DocLinkList
 *
 * @method DocLink Get(string $id)
 * @method DocLink GetByIndex(int $i)
 */
class DocLinkList extends AbricosModelList {
}

/**
 * Interface DocLinkSaveVars
 *
 * @property int $linkid
 * @property int $clientid
 * @property int $docid
 * @property int $elementid
 */
interface DocLinkSaveVars {
}

/**
 * Class DocLinkSave
 *
 * @property DocLinkSaveVars $vars
 * @property int $linkid
 * @property int $clientid
 * @property int $docid
 * @property string $docTitle
 * @property int $elementid
 * @property array $path
 * @property int $ord
 */
class DocLinkSave extends AbricosResponse {
    const CODE_OK = 1;

    protected $_structModule = 'doc';
    protected $_structName = 'LinkSave';
}

/**
 * Class DocOwner
 *
 * @property string $module
 * @property string $type
 * @property int $ownerid
 */
class DocOwner extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'Owner';
}
