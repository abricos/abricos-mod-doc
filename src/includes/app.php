<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocApp
 *
 * @property DocManager $manager
 */
class DocApp extends AbricosApplication {

    protected function GetClasses(){
        return array(
            "Doc" => "Doc",
            "DocList" => "DocList",
            "DocSave" => "DocSave",
            "Element" => "DocElement",
            "ElementList" => "DocElementList",
            "ElementType" => "DocElementType",
            "ElementTypeList" => "DocElementTypeList",
            "ElText" => "DocElText",
            "ElTextList" => "DocElTextList",
            "ElArticle" => "DocElArticle",
            "ElArticleList" => "DocElArticleList",
        );
    }

    protected function GetStructures(){
        return 'Doc,DocSave,Element,ElementType,ElText,ElArticle';
    }

    public function ResponseToJSON($d){
        switch ($d->do){
            case 'docList':
                return $this->DocListToJSON();
            case "docSave":
                return $this->DocSaveToJSON($d->data);
            case 'doc':
                return $this->DocToJSON($d->docid);
            case 'elementTypeList':
                return $this->ElementTypeListToJSON();
        }
        return null;
    }

    public function IsAdminRole(){
        return $this->manager->IsAdminRole();
    }

    public function IsWriteRole(){
        return $this->manager->IsWriteRole();
    }

    public function IsViewRole(){
        return $this->manager->IsViewRole();
    }

    private function ElementTypeInstance($name, $template, $model){
        $brick = Brick::$builder->LoadBrickS('doc', $template);

        return $this->InstanceClass('ElementType', array(
            'id' => $name,
            'template' => $brick->content,
            'model' => $model
        ));
    }

    public function ElementTypeListToJSON(){
        $ret = $this->ElementTypeList();
        return $this->ResultToJSON('elementTypeList', $ret);
    }

    /**
     * @return DocElementTypeList|int
     */
    public function ElementTypeList(){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        if ($this->CacheExists('ElementTypeList')){
            return $this->Cache('ElementTypeList');
        }

        /** @var DocElementTypeList $list */
        $list = $this->InstanceClass('ElementTypeList');
        $list->Add($this->ElementTypeInstance('text', 'elText', 'ElText'));
        $list->Add($this->ElementTypeInstance('article', 'elArticle', 'ElArticle'));

        $this->SetCache('ElementTypeList', $list);

        return $list;
    }

    public function DocListToJSON(){
        $ret = $this->DocList();
        return $this->ResultToJSON('docList', $ret);
    }

    /**
     * @return DocList|int
     */
    public function DocList(){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        /** @var DocList $list */
        $list = $this->InstanceClass('DocList');

        $rows = DocQuery::DocList($this->db);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass('Doc', $d));
        }

        return $list;
    }

    public function DocSaveToJSON($d){
        $ret = $this->DocSave($d);
        return $this->ResultToJSON('docSave', $ret);
    }

    /*
    "childs": [{"type": "text", "clientid": 2, "childs": [], "body": "<p>asdfawefe f</p>"}, {
        "type": "text",
        "clientid": 3,
        "childs": [],
        "body": "<p>w323423423423</p>"
    }],
    "docid": 1,
    "title": "asdfasdfa wefawefef"
     /**/

    public function DocSave($d){
        /** @var DocSave $ret */
        $ret = $this->InstanceClass('DocSave', $d);

        if (!$this->IsWriteRole()){
            return $ret->SetError(AbricosResponse::ERR_FORBIDDEN);
        }

        $vars = $ret->vars;

        if (empty($vars->title)){
            return $ret->SetError(
                AbricosResponse::ERR_BAD_REQUEST,
                DocSave::CODE_EMPTY_TITLE
            );
        }

        if ($ret->vars->docid === 0){
            $ret->docid = DocQuery::DocAppend($this->db, $ret);
        } else {
            $ret->docid = $vars->docid;
            DocQuery::DocUpdate($this->db, $ret);
        }

        $ret->AddCode(DocSave::CODE_OK);

        $doc = $this->Doc($ret->docid);

        if (isset($vars->childs) && is_array($vars->childs)){
            $this->DocChildsSave($doc, $vars->childs);
        }

        return $ret;
    }

    private function DocChildsSave(Doc $doc, $childs){

    }

    public function DocToJSON($docid){
        $ret = $this->Doc($docid);
        return $this->ResultToJSON('doc', $ret);
    }

    public function Doc($docid){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }
        if ($this->CacheExists('Doc', $docid)){
            return $this->Cache('Doc', $docid);
        }

        $docid = intval($docid);

        $d = DocQuery::Doc($this->db, $docid);
        if (empty($d)){
            return AbricosResponse::ERR_NOT_FOUND;
        }

        /** @var Doc $doc */
        $doc = $this->InstanceClass('Doc', $d);

        $rows = DocQuery::ElementList($this->db, $doc->id);
        while (($d = $this->db->fetch_array($rows))){
            /** @var DocElement $element */
            $element = $this->InstanceClass('Element', $d);
            $doc->elementList->Add($element);

            if (!isset($doc->extends[$element->type])){
                $doc->extends[$element->type] = $this->ElList($doc->id, $element->type);
            }
        }

        $this->SetCache('Doc', $docid);

        return $doc;
    }

    /**
     * @param $docid
     * @param $type
     * @return DocElList
     */
    private function ElList($docid, $type){
        $listClassName = DocElement::ListClassName($type);
        $itemClassName = DocElement::ItemClassName($type);

        /** @var DocElList $list */
        $list = $this->InstanceClass($listClassName);

        $rows = DocQuery::ElList($this->db, $docid, $type);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass($itemClassName, $d));
        }
        return $list;
    }
}
