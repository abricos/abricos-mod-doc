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

        return $ret;
    }

    public function DocToJSON($docid){
        $ret = $this->Doc($docid);
        return $this->ResultToJSON('doc', $ret);
    }

    public function Doc($docid){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }
        $docid = intval($docid);

        $d = DocQuery::Doc($this->db, $docid);
        if (empty($d)){
            return AbricosResponse::ERR_NOT_FOUND;
        }

        /** @var Doc $doc */
        $doc = $this->InstanceClass('Doc', $d);

        return $doc;
    }
}
