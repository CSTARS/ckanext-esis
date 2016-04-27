Polymer({
    is: 'app-nav',
    
    setQuery : function(e) {
        var status = e.currentTarget.getAttribute('status');
        
        $(this)
            .find('a')
            .removeClass('active');
        $(e.currentTarget).addClass('active');
        
        this.fire('update-query', {status: status});
    }
});