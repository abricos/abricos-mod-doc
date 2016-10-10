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
