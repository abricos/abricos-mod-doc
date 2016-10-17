<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocMenuItem
 */
class DocMenuItem extends SMMenuItem {

    /**
     * @var Doc
     */
    public $doc;

    public function __construct(SMMenuItem $parent, Doc $doc){
        parent::__construct(array(
            "id" => SMMenuItem::ToGlobalId("doc", $doc->id),
            "pid" => $parent->id,
            "nm" => $doc->GetName(),
            "tl" => $doc->title
        ));
        $this->doc = $doc;
    }
}