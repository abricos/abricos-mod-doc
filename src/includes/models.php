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
 * @property string $descript
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
}

/**
 * Class Doc
 *
 * @property string $title
 * @property string $descript
 */
class Doc extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'Doc';
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
}

/**
 * Class DocElementList
 *
 * @method DocElement Get(string $name)
 * @method DocElement GetByIndex(int $i)
 */
class DocElementList extends AbricosModelList {
}


/**
 * Class DocElementText
 *
 * @property int $id Element ID
 * @property int $docid
 * @property string $body
 */
class DocElementText extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'ElementText';
}

/**
 * Class DocElementTextList
 *
 * @method DocElementText Get(string $name)
 * @method DocElementText GetByIndex(int $i)
 */
class DocElementTextList extends AbricosModelList {
}

/**
 * Class DocElementArticle
 *
 * @property int $id Element ID
 * @property int $docid
 * @property string $title
 */
class DocElementArticle extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'ElementArticle';
}

/**
 * Class DocElementArticleList
 *
 * @method DocElementArticle Get(string $name)
 * @method DocElementArticle GetByIndex(int $i)
 */
class DocElementArticleList extends AbricosModelList {
}
