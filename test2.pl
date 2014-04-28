for (my $i =0; $i < 30;$i++) {
    my $tmp = '<li id="li' . ($i+1) . '" class="cl' . ($i+1) . '"><div class="ui-grid-a"><div class="ui-block-a" style="width:10%;"><h3>' . ($i+1). '</h3></div><div class="ui-block-b" style="width:90%;"><input type="text" /></div></div></li>';
    print $tmp , "\n";
}
