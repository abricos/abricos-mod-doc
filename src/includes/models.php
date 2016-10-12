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

            $ret->elements[] = $es->ToJSON();
        }

        return $ret;
    }

}

/**
 * Class Doc
 *
 * @property string $title
 * @property DocElementList $elementList
 * @property array $extends
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
 * @property string $type
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

    protected $_structModule = 'doc';
    protected $_structName = 'ElementSave';
}

/**
 * Class DocElementList
 *
 * @method DocElement Get(int $elementid)
 * @method DocElement GetByIndex(int $i)
 */
class DocElementList extends AbricosModelList {
}

/**
 * Class DocEl
 *
 * @property int $id Element ID
 */
abstract class DocEl extends AbricosModel {
    protected $_structModule = 'doc';
}

/**
 * Class DocElList
 *
 * @method DocEl Get(string $elementid)
 * @method DocEl GetByIndex(int $i)
 */
abstract class DocElList extends AbricosModelList {
}

/**
 * Class DocElText
 *
 * @property int $docid
 * @property string $body
 */
class DocElText extends DocEl {
    protected $_structName = 'ElText';
}

/**
 * Class DocElTextList
 *
 * @method DocElText Get(string $name)
 * @method DocElText GetByIndex(int $i)
 */
class DocElTextList extends DocElList {
}

/**
 * Class DocElArticle
 *
 * @property int $id Element ID
 * @property int $docid
 * @property string $title
 */
class DocElArticle extends DocEl {
    protected $_structName = 'ElArticle';
}

/**
 * Class DocElArticleList
 *
 * @method DocElArticle Get(string $name)
 * @method DocElArticle GetByIndex(int $i)
 */
class DocElArticleList extends DocElList {
}
