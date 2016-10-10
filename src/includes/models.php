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
 * Class DocElText
 *
 * @property int $id Element ID
 * @property int $docid
 * @property string $body
 */
class DocElText extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'ElText';
}

/**
 * Class DocElTextList
 *
 * @method DocElText Get(string $name)
 * @method DocElText GetByIndex(int $i)
 */
class DocElTextList extends AbricosModelList {
}

/**
 * Class DocElArticle
 *
 * @property int $id Element ID
 * @property int $docid
 * @property string $title
 */
class DocElArticle extends AbricosModel {
    protected $_structModule = 'doc';
    protected $_structName = 'ElArticle';
}

/**
 * Class DocElArticleList
 *
 * @method DocElArticle Get(string $name)
 * @method DocElArticle GetByIndex(int $i)
 */
class DocElArticleList extends AbricosModelList {
}
